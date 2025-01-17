const DappToken = artifacts.require("DappToken")
const DaiToken = artifacts.require("DaiToken")
const TokenFarm = artifacts.require("TokenFarm")

module.exports = async function (callback) {
  let tokenFarm = await TokenFarm.deployed()
  await tokenFarm.issueTokens();

  console.log("Tokens issued!");

  callback();
}