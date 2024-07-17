export const resolvers = {
  Business: {
    waitTime: (obj: any, args: any, context: any, info: any) => {
      const options = [0, 5, 10, 15, 30, 45];
      return options[Math.floor(Math.random() * options.length)];
    },
  },
};
