import React, { FC, HTMLAttributes, FunctionComponent } from 'react';

export interface CrystallizeImageVariant {
  url: string;
  width: number;
  height: number;
}

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: FunctionComponent<any>;
  src: string;
  url: string;
  sizes: string;
  altText: string;
  alt: string;
  variants: CrystallizeImageVariant[];
}

function getVariantSrc(variant: CrystallizeImageVariant): string {
  return `${variant.url} ${variant.width}w`;
}

export const Image: FC<Props> = ({ children, ...restOfAllProps }) => {
  // Regular image
  // if (restOfAllProps.src) {
  //   if (children) {
  //     return children(restOfAllProps);
  //   }

  //   return <img {...restOfAllProps} />;
  // }

  // Continue using data from Crystallize
  const {
    src,
    url,
    sizes,
    variants,
    altText,
    alt: altPassed,
    className,
    ...rest
  } = restOfAllProps;

  const vars = (variants || []).filter(v => !!v);
  const alt = typeof altPassed === 'string' ? altPassed : altText;

  const hasVariants = vars.length > 0;

  // Get the biggest image from the variants
  let biggestImage: CrystallizeImageVariant = vars[0];
  if (hasVariants) {
    biggestImage = vars.reduce(function(
      acc: CrystallizeImageVariant,
      v: CrystallizeImageVariant
    ): CrystallizeImageVariant {
      if (!acc.width || v.width > acc.width) {
        return v;
      }
      return acc;
    },
    vars[0]);
  }

  // Determine srcSet
  const std = vars.filter(v => v.url && !v.url.endsWith('.webp'));
  const webp = vars.filter(v => v.url && v.url.endsWith('.webp'));
  const srcSet = std.map(getVariantSrc).join(', ');
  const srcSetWebp = webp.map(getVariantSrc).join(', ');

  // Determine the original file extension
  let originalFileExtension = 'jpeg';
  if (std.length > 0) {
    const match = std[0].url.match(/\.(?<name>[^.]+)$/);
    let originalFileExtension = match?.groups?.name;

    // Provide correct mime type for jpg
    if (originalFileExtension === 'jpg') {
      originalFileExtension = 'jpeg';
    }
  }

  const commonProps = {
    // Ensure fallback src for older browsers
    src: src || url || (hasVariants ? std[0].url : undefined),
    alt,
    width: biggestImage?.width,
    height: biggestImage?.height,
  };

  if (children) {
    return children({
      srcSet,
      srcSetWebp,
      className,
      sizes,
      ...commonProps,
      ...rest,
      originalFileExtension,
    });
  }

  return (
    <picture className={className}>
      {srcSetWebp.length > 0 && (
        <source srcSet={srcSetWebp} type="image/webp" sizes={sizes} />
      )}
      {srcSet.length > 0 && (
        <source
          srcSet={srcSet}
          type={`image/${originalFileExtension}`}
          sizes={sizes}
        />
      )}

      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img {...commonProps} {...rest} />
    </picture>
  );
};
