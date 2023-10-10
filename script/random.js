const randomSeed = () => Math.round(Math.random() * 99999999);

const rnd = () => {
  let seed = randomSeed();
  let gen = new Math.seedrandom(seed);

  const newSeed = () => {
    seed = randomSeed();
    gen = new Math.seedrandom(seed);
  };

  const setSeed = (newSeed) => {
    seed = newSeed;
    gen = new Math.seedrandom(seed);
  };

  const getSeed = () => seed;

  const reset = () => setSeed(seed);

  return { random: () => gen(), getSeed, setSeed, reset, newSeed };
};

export default rnd();
