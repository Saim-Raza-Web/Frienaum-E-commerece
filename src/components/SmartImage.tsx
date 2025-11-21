import Image, { ImageProps } from 'next/image';

type SmartImageProps = Omit<ImageProps, 'src' | 'alt' | 'fill'> & {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  fill?: boolean;
};

export default function SmartImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  fill = false,
  width = 400,
  height = 400,
  sizes,
  className,
  priority = false,
  ...rest
}: SmartImageProps) {
  const resolvedSrc = src && src.trim().length > 0 ? src : fallbackSrc;
  const isRemote = resolvedSrc.startsWith('http://') || resolvedSrc.startsWith('https://');

  const sharedProps = {
    className,
    priority,
    unoptimized: isRemote,
    ...rest,
  };

  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes ?? '100vw'}
        {...sharedProps}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes ?? `${width}px`}
      {...sharedProps}
    />
  );
}

