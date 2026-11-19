<?php
/**
 * Tipo di contenuto "Camere" con prezzo, ospiti e metratura.
 *
 * I dati delle camere si mostrano nei template con le Block Bindings
 * (sorgente "casale/camera"), quindi restano modificabili dall'Editor del sito.
 *
 * @package Casale
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registra il post type "camera".
 */
function casale_register_camere() {
	register_post_type(
		'camera',
		array(
			'labels'       => array(
				'name'               => __( 'Camere', 'casale' ),
				'singular_name'      => __( 'Camera', 'casale' ),
				'add_new'            => __( 'Aggiungi camera', 'casale' ),
				'add_new_item'       => __( 'Aggiungi nuova camera', 'casale' ),
				'edit_item'          => __( 'Modifica camera', 'casale' ),
				'all_items'          => __( 'Tutte le camere', 'casale' ),
				'view_item'          => __( 'Vedi camera', 'casale' ),
				'search_items'       => __( 'Cerca camere', 'casale' ),
				'not_found'          => __( 'Nessuna camera trovata', 'casale' ),
				'featured_image'     => __( 'Foto della camera', 'casale' ),
				'set_featured_image' => __( 'Imposta foto della camera', 'casale' ),
			),
			'public'       => true,
			'has_archive'  => 'camere',
			'rewrite'      => array( 'slug' => 'camere' ),
			'menu_icon'    => 'dashicons-admin-home',
			'menu_position' => 20,
			'show_in_rest' => true,
			'supports'     => array( 'title', 'editor', 'excerpt', 'thumbnail', 'custom-fields', 'page-attributes' ),
			'template'     => array(
				array( 'core/paragraph', array( 'placeholder' => __( 'Descrivi la camera: vista, arredi, servizi…', 'casale' ) ) ),
			),
		)
	);

	$meta = array(
		'prezzo' => array( 'type' => 'number', 'label' => __( 'Prezzo a notte (€)', 'casale' ) ),
		'ospiti' => array( 'type' => 'integer', 'label' => __( 'Ospiti', 'casale' ) ),
		'mq'     => array( 'type' => 'integer', 'label' => __( 'Metri quadri', 'casale' ) ),
	);

	foreach ( $meta as $key => $args ) {
		register_post_meta(
			'camera',
			$key,
			array(
				'type'              => $args['type'],
				'label'             => $args['label'],
				'single'            => true,
				'show_in_rest'      => true,
				'default'           => 0,
				'sanitize_callback' => 'number' === $args['type'] ? 'casale_sanitize_price' : 'absint',
				'auth_callback'     => static fn() => current_user_can( 'edit_posts' ),
			)
		);
	}
}
add_action( 'init', 'casale_register_camere' );

/**
 * Prezzo: numero positivo con al massimo due decimali.
 *
 * @param mixed $value Valore inserito.
 * @return float
 */
function casale_sanitize_price( $value ) {
	return round( max( 0, (float) $value ), 2 );
}

/**
 * Sorgente di Block Bindings: testi già formattati per le camere.
 * Uso nel markup: "metadata":{"bindings":{"content":{"source":"casale/camera","args":{"key":"prezzo"}}}}
 */
function casale_register_bindings() {
	if ( ! function_exists( 'register_block_bindings_source' ) ) {
		return;
	}

	register_block_bindings_source(
		'casale/camera',
		array(
			'label'              => __( 'Dati della camera', 'casale' ),
			'uses_context'       => array( 'postId', 'postType' ),
			'get_value_callback' => 'casale_camera_binding_value',
		)
	);
}
add_action( 'init', 'casale_register_bindings' );

/**
 * Restituisce il testo da mostrare per una chiave (prezzo, ospiti, mq, riepilogo).
 *
 * @param array    $args     Argomenti del binding.
 * @param WP_Block $block    Blocco corrente.
 * @return string|null
 */
function casale_camera_binding_value( array $args, $block ) {
	$post_id = $block->context['postId'] ?? get_the_ID();
	if ( ! $post_id || 'camera' !== get_post_type( $post_id ) ) {
		return null;
	}

	$prezzo = (float) get_post_meta( $post_id, 'prezzo', true );
	$ospiti = (int) get_post_meta( $post_id, 'ospiti', true );
	$mq     = (int) get_post_meta( $post_id, 'mq', true );

	switch ( $args['key'] ?? '' ) {
		case 'prezzo':
			/* translators: %s: prezzo a notte. */
			return $prezzo ? sprintf( __( 'da %s € a notte', 'casale' ), number_format_i18n( $prezzo, 0 ) ) : __( 'Prezzo su richiesta', 'casale' );
		case 'ospiti':
			/* translators: %d: numero di ospiti. */
			return sprintf( _n( '%d ospite', '%d ospiti', $ospiti, 'casale' ), $ospiti );
		case 'mq':
			return $mq ? sprintf( '%d m²', $mq ) : '';
		case 'riepilogo':
			$parts = array_filter(
				array(
					/* translators: %d: numero di ospiti. */
					$ospiti ? sprintf( _n( '%d ospite', '%d ospiti', $ospiti, 'casale' ), $ospiti ) : '',
					$mq ? sprintf( '%d m²', $mq ) : '',
				)
			);
			return implode( ' · ', $parts );
	}

	return null;
}

/**
 * Archivio camere ordinato per "Ordine" (menu_order), poi per titolo.
 *
 * @param WP_Query $query Query principale.
 */
function casale_order_camere( $query ) {
	if ( ! is_admin() && $query->is_main_query() && $query->is_post_type_archive( 'camera' ) ) {
		$query->set( 'orderby', array( 'menu_order' => 'ASC', 'title' => 'ASC' ) );
	}
}
add_action( 'pre_get_posts', 'casale_order_camere' );

/**
 * Colonne extra nell'elenco camere della bacheca.
 *
 * @param array $columns Colonne.
 * @return array
 */
function casale_camera_columns( $columns ) {
	$columns['prezzo'] = __( 'Prezzo', 'casale' );
	$columns['ospiti'] = __( 'Ospiti', 'casale' );
	return $columns;
}
add_filter( 'manage_camera_posts_columns', 'casale_camera_columns' );

/**
 * Contenuto delle colonne extra.
 *
 * @param string $column  Nome colonna.
 * @param int    $post_id ID camera.
 */
function casale_camera_column_content( $column, $post_id ) {
	if ( 'prezzo' === $column ) {
		$prezzo = (float) get_post_meta( $post_id, 'prezzo', true );
		echo $prezzo ? esc_html( number_format_i18n( $prezzo, 0 ) . ' €' ) : '—';
	}
	if ( 'ospiti' === $column ) {
		echo esc_html( (int) get_post_meta( $post_id, 'ospiti', true ) );
	}
}
add_action( 'manage_camera_posts_custom_column', 'casale_camera_column_content', 10, 2 );

/**
 * Al cambio tema aggiorna i permalink, così /camere/ funziona subito.
 */
function casale_flush_rewrites() {
	casale_register_camere();
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'casale_flush_rewrites' );
