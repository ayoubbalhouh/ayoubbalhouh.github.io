<?php
/**
 * Title: Hero con colline
 * Slug: casale/hero
 * Categories: casale, banner
 * Keywords: hero, copertina, home
 * Description: Grande apertura con illustrazione dei colli, titolo e pulsanti.
 *
 * @package Casale
 */

$casale_img = esc_url( get_theme_file_uri( 'assets/images/colline.svg' ) );
?>
<!-- wp:cover {"url":"<?php echo $casale_img; ?>","dimRatio":0,"minHeight":88,"minHeightUnit":"vh","contentPosition":"top center","isDark":false,"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-cover alignfull is-light has-custom-content-position is-position-top-center" style="padding-top:var(--wp--preset--spacing--60);min-height:88vh"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim"></span><img class="wp-block-cover__image-background" alt="" src="<?php echo $casale_img; ?>" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","className":"is-style-etichetta"} -->
<p class="has-text-align-center is-style-etichetta">Agriturismo sui Colli Euganei</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.8rem, 7vw, 5.5rem)"}}} -->
<h1 class="wp-block-heading has-text-align-center" style="font-size:clamp(2.8rem, 7vw, 5.5rem)">Dormi tra le vigne,<br><em>svegliati sui colli.</em></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"1.15rem"}},"textColor":"muted"} -->
<p class="has-text-align-center has-muted-color has-text-color" style="font-size:1.15rem">Sei camere in un casale del Settecento, colazione con i prodotti dell'orto e passeggiate tra ulivi e cipressi. A 20 minuti da Padova.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/camere/">Scopri le camere</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#esperienze">Cosa fare qui</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:cover -->
