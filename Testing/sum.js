const sum = (a, b) => {
  if (a === undefined || b === undefined) {
    throw new Error("error");
  }
  
  return a + b;
};


module.exports = sum;
