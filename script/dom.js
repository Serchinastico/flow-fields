export const showNode = (node) => {
  node.classList.add("flex");
  node.classList.remove("dn");
};

export const hideNode = (node) => {
  node.classList.add("dn");
  node.classList.remove("flex");
};
