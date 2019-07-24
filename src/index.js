import React from "react";
import PropTypes from "prop-types";

let DEV = false;
try {
  DEV = process.env.NODE_ENV !== "production";
} catch (e) {
  DEV = false;
}

function warn(msg) {
  if (DEV) {
    console.warn(`@crystallize/react-image: ${msg}`);
  }
}

const getVariantSrc = variant => `${variant.url} ${variant.width}w`;

const ReactImage = ({ children: childRenderFunc, ...restOfAllProps }) => {
  // Regular image
  if (restOfAllProps.src) {
    if (childRenderFunc) {
      return childRenderFunc(restOfAllProps);
    }

    return <img {...restOfAllProps} />;
  }

  // Continue using data from Crystallize
  const { url, sizes, variants = [], altText: alt, ...rest } = restOfAllProps;
  const hasVariants = variants.length > 0;

  // Determine srcSet
  const std = variants.filter(v => v.url && !v.url.endsWith(".webp"));
  const webp = variants.filter(v => v.url && v.url.endsWith(".webp"));
  const srcSet = std.map(getVariantSrc).join(", ");
  const srcSetWebp = webp.map(getVariantSrc).join(", ");

  // Ensure fallback src for older browsers
  const src = url || (hasVariants ? std[0].url : undefined);

  if (childRenderFunc) {
    return childRenderFunc({
      src,
      srcSet,
      srcSetWebp,
      sizes,
      alt,
      ...rest
    });
  }

  if (hasVariants && !sizes) {
    warn(
      "You have provided variants, but not sizes. This has a negative impact on performance. Check out https://crystallize.com/blog/react-image-sizes-attribute-for-fast-ecommerce"
    );
  }

  return (
    <picture>
      {srcSetWebp.length > 0 && (
        <source srcSet={srcSetWebp} type="image/webp" sizes={sizes} />
      )}
      {srcSet.length > 0 && (
        <source srcSet={srcSet} type="image/jpg" sizes={sizes} />
      )}

      <img src={src} sizes={sizes} alt={alt} {...rest} />
    </picture>
  );
};

ReactImage.propTypes = {
  children: PropTypes.func,
  src: PropTypes.string,
  url: PropTypes.string,
  variants: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string,
      width: PropTypes.number
    })
  ),
  sizes: PropTypes.string
};

export default ReactImage;
