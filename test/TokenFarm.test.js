const { assert } = require('chai')

const DappToken = artifacts.require("DappToken")
const DaiToken = artifacts.require("DaiToken")
const TokenFarm = artifacts.require("TokenFarm")
const OneMillion = '1000000'
const OneHundred = '100'
const Zero = '0'

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    // test init
    before(async () => {
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        // transfer all Dapp tokens to farm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens(OneMillion))

        // Send tokens to investor
        await daiToken.transfer(investor, tokens(OneHundred), { from : owner})
    })

    // Write tests here...
    describe('Mock DAI delpoyment', async () => {
        it('has a name', async() => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token');
        })
    })

    describe('Dapp Token Deployment', async() => {
        it('has a name', async() => {
            const name = await dappToken.name()
            assert.equal(name, 'Dapp Token')
        })
    })

    describe('Token Farm Deployment', async() => {
        it('has a name', async() => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })
    })

    it('contract has tokens', async () => {
        let balance = await dappToken.balanceOf(tokenFarm.address)
        assert.equal(balance.toString(), tokens(OneMillion))
    })

    describe('Farming tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result 
            // Check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(OneHundred), 'investor Mock DAI wallet balance correct before staking')

            // Stake Mock DAI Tokens
            await daiToken.approve(tokenFarm.address, tokens(OneHundred), { from: investor} )
            await tokenFarm.stakeTokens(tokens(OneHundred), { from: investor})

            // Check staking results
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(Zero), 'investor Mock DAI wallet balance correct after staking')
            
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens(OneHundred), 'Token Farm Mock DAI balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens(OneHundred), 'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

            // Issue Tokens
            await tokenFarm.issueTokens({ from : owner })

            // Check balances after issuence
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(OneHundred), 'investor Dapp Token wallet balance correct after issuence')

            // Ensure only owner can issue tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected
        })
    }  )



})