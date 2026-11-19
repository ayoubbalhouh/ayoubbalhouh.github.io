<?php
/**
 * Casale: funzioni del tema.
 *
 * @package Casale
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CASALE_VERSION', '1.0.0' );

require_once get_theme_file_path( 'inc/camere.php' );

/**
 * Impostazioni di base.
 */
function casale_setup() {
	add_theme_support( 'editor-styles' );
	add_editor_style( array( casale_fonts_url(), 'style.css' ) );
	load_theme_textdomain( 'casale', get_theme_file_path( 'languages' ) );
}
add_action( 'after_setup_theme', 'casale_setup' );

/**
 * Font da Google Fonts (Fraunces per i titoli, Inter per il testo).
 */
function casale_fonts_url() {
	return 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap';
}

/**
 * Stili del tema.
 */
function casale_enqueue() {
	wp_enqueue_style( 'casale-fonts', casale_fonts_url(), array(), null );
	wp_enqueue_style( 'casale-style', get_stylesheet_uri(), array(), CASALE_VERSION );
}
add_action( 'wp_enqueue_scripts', 'casale_enqueue' );

/**
 * Categoria per i pattern del tema.
 */
function casale_pattern_categories() {
	register_block_pattern_category(
		'casale',
		array( 'label' => __( 'Casale', 'casale' ) )
	);
}
add_action( 'init', 'casale_pattern_categories' );

/**
 * Stili di blocco extra, selezionabili dalla barra laterale dell'editor.
 */
function casale_block_styles() {
	register_block_style(
		'core/image',
		array(
			'name'         => 'arco',
			'label'        => __( 'Arco', 'casale' ),
			'inline_style' => '.wp-block-image.is-style-arco img { border-radius: 999px 999px 18px 18px; }',
		)
	);
	register_block_style(
		'core/post-featured-image',
		array(
			'name'         => 'arco',
			'label'        => __( 'Arco', 'casale' ),
			'inline_style' => '.wp-block-post-featured-image.is-style-arco, .wp-block-post-featured-image.is-style-arco img { border-radius: 999px 999px 18px 18px; }',
		)
	);
	register_block_style(
		'core/group',
		array(
			'name'         => 'scheda',
			'label'        => __( 'Scheda', 'casale' ),
			'inline_style' => '.wp-block-group.is-style-scheda { background: #fff; border-radius: 18px; box-shadow: 0 1px 2px rgba(42,42,34,.06), 0 12px 32px rgba(42,42,34,.07); }',
		)
	);
	register_block_style(
		'core/paragraph',
		array(
			'name'         => 'etichetta',
			'label'        => __( 'Etichetta', 'casale' ),
			'inline_style' => '.is-style-etichetta { text-transform: uppercase; letter-spacing: .12em; font-size: .78rem !important; font-weight: 600; color: var(--wp--preset--color--secondary); }',
		)
	);
}
add_action( 'init', 'casale_block_styles' );

/**
 * Prestazioni: i browser moderni mostrano le emoji da soli,
 * quindi togliamo lo script e gli stili delle emoji di WordPress.
 */
function casale_disable_emoji() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
}
add_action( 'init', 'casale_disable_emoji' );
