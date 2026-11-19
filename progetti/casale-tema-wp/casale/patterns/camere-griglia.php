<?php
/**
 * Title: Griglia delle camere
 * Slug: casale/camere-griglia
 * Categories: casale, query
 * Keywords: camere, stanze, query
 * Description: Le camere in tre colonne con foto ad arco, prezzo e ospiti.
 *
 * @package Casale
 */
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:group {"align":"wide","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"bottom"}} -->
<div class="wp-block-group alignwide"><!-- wp:group {"layout":{"type":"constrained","contentSize":"560px","justifyContent":"left"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-etichetta"} -->
<p class="is-style-etichetta">Le camere</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2 class="wp-block-heading">Sei stanze, nessuna uguale all'altra</h2>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="/camere/">Tutte le camere</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:query {"queryId":11,"query":{"perPage":3,"pages":0,"offset":0,"postType":"camera","order":"asc","orderBy":"menu_order","author":"","search":"","exclude":[],"sticky":"","inherit":false},"align":"wide"} -->
<div class="wp-block-query alignwide"><!-- wp:post-template {"style":{"spacing":{"blockGap":"var:preset|spacing|50"}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":"16rem"}} -->
<!-- wp:group {"className":"casale-camera-card","style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group casale-camera-card"><!-- wp:post-featured-image {"isLink":true,"aspectRatio":"3/4","className":"is-style-arco"} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"casale/camera","args":{"key":"riepilogo"}}}},"textColor":"muted","fontSize":"small","style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
<p class="has-muted-color has-text-color has-small-font-size" style="margin-top:var(--wp--preset--spacing--30)"></p>
<!-- /wp:paragraph -->

<!-- wp:post-title {"level":3,"isLink":true,"style":{"elements":{"link":{"color":{"text":"var:preset|color|contrast"}}}}} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"casale/camera","args":{"key":"prezzo"}}}},"textColor":"secondary","style":{"typography":{"fontWeight":"600"}}} -->
<p class="has-secondary-color has-text-color" style="font-weight:600"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
<!-- /wp:post-template -->

<!-- wp:query-no-results -->
<!-- wp:paragraph -->
<p>Aggiungi le camere dalla bacheca: <strong>Camere → Aggiungi camera</strong>.</p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:query --></div>
<!-- /wp:group -->
