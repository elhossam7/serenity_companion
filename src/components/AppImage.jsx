import React from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={() => setLoaded(true)}
      onError={(e) => {
        e.target.src = "/assets/images/no_image.png";
        setLoaded(true);
      }}
      {...props}
    />
  );
}

export default Image;
