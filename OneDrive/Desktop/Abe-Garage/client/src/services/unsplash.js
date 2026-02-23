export const fetchRandomImage = async (
  query = "car",
  orientation = "landscape"
) => {
  try {
    // Use source.unsplash.com for free random images without API key
    const width = orientation === "landscape" ? 1600 : 900;
    const height = orientation === "landscape" ? 900 : 1600;
    const url = `https://source.unsplash.com/random/${width}x${height}/?${query.replace(
      " ",
      ","
    )}`;

    return {
      id: `random-${Date.now()}`,
      url: url,
      thumb: url.replace(`${width}x${height}`, "400x300"),
      full: url,
      description: `${query} image`,
      photographer: "Unsplash",
      photographerUrl: "https://unsplash.com",
    };
  } catch (error) {
    console.error("Error fetching Unsplash image:", error);
    return null;
  }
};

export const fetchMultipleImages = async (
  query = "car",
  count = 5,
  orientation = "landscape"
) => {
  try {
    const images = [];
    for (let i = 0; i < count; i++) {
      const image = await fetchRandomImage(query, orientation);
      if (image) {
        images.push(image);
      }
    }
    return images;
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);
    return [];
  }
};
