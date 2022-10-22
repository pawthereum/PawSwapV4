Moralis.Cloud.define("leaderboard", async (request) => {
  const buyPipeline = [
    // exclude situations where the user donates to themselves
    { match: { $expr: { $ne: ['$customTaxAddress', '$buyer'] } } },
    // sum the amount donated from the buy transactions of each token
    { group: { objectId: '$tokenAddress',  ethDonated: { $sum: {$toLong : '$customTaxAmount'} } } },
    // sort by the amount donated
    { sort: { ethDonated: -1 } },
  ];
  const sellPipeline = [
    // exclude situations where the user donates to themselves
    { match: { $expr: { $ne: ['$customTaxAddress', '$buyer'] } } },
    // sum the amount donated from the buy transactions of each token
    { group: { objectId: '$tokenAddress',  ethDonated: { $sum: {$toLong : '$customTaxAmount'} } } },
    // sort by the amount donated
    { sort: { ethDonated: -1 } },
  ];
  const buyQuery = new Moralis.Query("BuysBsc");
  const sellQuery = new Moralis.Query("SellsBsc");
  try {
    return await Promise.all([
      buyQuery.aggregate(buyPipeline),
      sellQuery.aggregate(sellPipeline),
    ]);
  } catch (e) {
    return e;
  }
});