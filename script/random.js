const randomSeed = () => Math.round(Math.random() * 99999999);

const rnd = () => {
  let seed = randomSeed();
  let gen = new Math.seedrandom(seed);

  const resetSeed = () => {
    seed = randomSeed();
    gen = new Math.seedrandom(seed);
  };

  const setSeed = (newSeed) => {
    seed = newSeed;
    gen = new Math.seedrandom(seed);
  };

  return { random: () => gen(), getSeed: () => seed, setSeed, resetSeed };
};

export default rnd();
