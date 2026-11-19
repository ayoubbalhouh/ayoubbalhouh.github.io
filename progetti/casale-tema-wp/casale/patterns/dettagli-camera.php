<?php
/**
 * Title: Dettagli della camera
 * Slug: casale/dettagli-camera
 * Categories: casale
 * Inserter: no
 * Description: Prezzo, ospiti e metratura della camera (Block Bindings). Usato nel template della singola camera.
 *
 * @package Casale
 */
?>
<!-- wp:group {"className":"is-style-scheda","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40","right":"var:preset|spacing|40"},"blockGap":"0.4rem"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group is-style-scheda" style="padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--40)"><!-- wp:paragraph {"className":"is-style-etichetta"} -->
<p class="is-style-etichetta">La camera</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"casale/camera","args":{"key":"prezzo"}}}},"style":{"typography":{"fontSize":"1.6rem"}},"fontFamily":"heading"} -->
<p class="has-heading-font-family" style="font-size:1.6rem"></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"casale/camera","args":{"key":"riepilogo"}}}},"textColor":"muted"} -->
<p class="has-muted-color has-text-color"></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"textColor":"muted","fontSize":"small"} -->
<p class="has-muted-color has-text-color has-small-font-size">Colazione inclusa · Wi-Fi · Parcheggio · Biciclette</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--30)"><!-- wp:button {"width":100} -->
<div class="wp-block-button has-custom-width wp-block-button__width-100"><a class="wp-block-button__link wp-element-button" href="/#contatti">Chiedi disponibilità</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
