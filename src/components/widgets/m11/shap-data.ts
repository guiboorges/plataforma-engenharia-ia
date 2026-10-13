// Dados do widget SHAP (secção 5): cinco horas do conjunto de teste do Bikeshare, com os valores SHAP do
// HistGradientBoostingRegressor(random_state=0) da aula (treinado com GroupShuffleSplit(test_size=0.2, random_state=0)
// por dias), calculados com shap.TreeExplainer (shap 0.53, scikit-learn 1.9.1). A primeira é a da figura da aula.
// Contribuições arredondadas a 4 casas (base + soma = previsão, a menos de 0,001); valores das variáveis a 3 casas,
// como o shap os mostra (atemp 0,2424 aparece como 0,242).

export const SHAP_COLS: readonly string[] = ["season", "day", "hr", "holiday", "weekday", "workingday", "temp", "atemp", "hum", "windspeed", "mnth_Aug", "mnth_Dec", "mnth_Feb", "mnth_Jan", "mnth_July", "mnth_June", "mnth_March", "mnth_May", "mnth_Nov", "mnth_Oct", "mnth_Sept", "weathersit_cloudy/misty", "weathersit_heavy rain/snow", "weathersit_light rain/snow"];

export type ShapRow = { label: string; base: number; pred: number; real: number; x: number[]; phi: number[] };

export const SHAP_ROWS: readonly ShapRow[] = [
  {
    label: "6 de janeiro, 0h (dia útil, a da aula)",
    base: 144.5038,
    pred: 10.7965,
    real: 11,
    x: [1.0, 6.0, 0.0, 0.0, 4.0, 1.0, 0.18, 0.242, 0.55, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    phi: [-10.0267, -20.0914, -76.9446, -0.0059, -0.3836, -2.6904, -18.9309, -9.9009, 3.299, 0.3168, 0.0673, 0.0, -0.0103, 0.0, -0.0652, 0.0088, -0.0353, -0.0196, 0.1254, -0.0283, -0.0199, 0.3089, 0.0, 1.3196],
  },
  {
    label: "6 de janeiro, 8h (dia útil)",
    base: 144.5038,
    pred: 190.5697,
    real: 219,
    x: [1.0, 6.0, 8.0, 0.0, 4.0, 1.0, 0.16, 0.227, 0.59, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    phi: [-27.8986, -39.302, 137.7756, -0.0404, 6.022, 31.225, -53.6156, -18.0816, 4.6185, 1.4823, 0.0832, 0.0, -0.0276, 0.0, -0.0653, -0.042, -0.1201, -0.0041, 0.1217, -0.0356, -0.0199, 0.4592, 0.0, 3.5312],
  },
  {
    label: "30 de julho, 14h (sábado)",
    base: 144.5038,
    pred: 282.9981,
    real: 305,
    x: [3.0, 211.0, 14.0, 0.0, 6.0, 0.0, 0.9, 0.788, 0.29, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    phi: [8.1613, 0.6228, 82.2128, 0.1233, 5.8101, 44.4596, -2.96, -21.1718, 15.7069, 1.1912, -0.1455, 0.0, -0.0234, 0.0, 0.3881, 0.0107, -0.0187, 0.0304, 0.1274, -0.0342, -0.0395, 0.5513, 0.0, 3.4915],
  },
  {
    label: "11 de julho, 17h (segunda-feira)",
    base: 144.5038,
    pred: 456.239,
    real: 514,
    x: [3.0, 192.0, 17.0, 0.0, 1.0, 1.0, 0.86, 0.849, 0.56, 0.418, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    phi: [10.3209, 18.9617, 240.0522, -0.0321, 4.907, 21.1248, 15.6567, -16.8298, 12.6433, -1.8927, 0.2925, 0.0, -0.0287, 0.0, 0.718, -0.0009, -0.0119, -0.0266, 0.2073, -0.2801, -0.0141, 1.4931, 0.0, 4.4745],
  },
  {
    label: "13 de dezembro, 8h (dia útil)",
    base: 144.5038,
    pred: 382.2087,
    real: 400,
    x: [4.0, 347.0, 8.0, 0.0, 2.0, 1.0, 0.2, 0.227, 0.69, 0.104, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    phi: [25.6145, 20.4969, 183.1207, -0.0544, 8.7448, 48.0751, -44.2375, -18.8687, 3.4493, 0.6912, 0.0891, 0.0, -0.0268, 0.0, -0.0967, -0.019, -0.0144, -0.0301, 0.1252, -0.0417, -0.0351, 0.7179, 0.0, 10.0047],
  },
];
