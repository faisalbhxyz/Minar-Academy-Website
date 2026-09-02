module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "react-native-iconify/babel",
        {
          icons: [
            "solar:alt-arrow-down-linear",
            "solar:book-2-bold",
            "solar:book-2-outline",
            "solar:chart-2-bold",
            "solar:chart-2-bold",
            "solar:check-circle-bold",
            "solar:clipboard-list-bold",
            "solar:clock-circle-outline",
            "solar:cup-star-bold",
            "solar:diploma-bold",
            "solar:document-text-bold",
            "solar:download-minimalistic-bold",
            "solar:eye-bold",
            "solar:eye-closed-bold",
            "solar:home-2-bold",
            "solar:home-2-outline",
            "solar:info-circle-linear",
            "solar:lock-keyhole-bold",
            "solar:notebook-bold",
            "solar:play-circle-bold",
            "solar:play-circle-outline",
            "solar:share-bold",
            "solar:trash-bin-trash-outline",
            "solar:user-circle-bold",
            "solar:user-circle-outline",
            "solar:users-group-rounded-bold",
          ],
        },
      ],
    ],
  };
};
