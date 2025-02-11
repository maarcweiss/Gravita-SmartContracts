const deploymentHelper = require("../../utils/deploymentHelpers.js")
const testHelpers = require("../../utils/testHelpers.js")
const VesselManagerTester = artifacts.require("VesselManagerTester")

const th = testHelpers.TestHelper
const dec = th.dec
const toBN = th.toBN
const assertRevert = th.assertRevert

contract("Access Control: functions where the caller is restricted to Gravita contract(s)", async accounts => {
	let contracts
	const openVessel = async params => th.openVessel(contracts, params)
	const [alice, bob] = accounts

	before(async () => {
		contracts = await deploymentHelper.deployGravitaCore()
		contracts.vesselManager = await VesselManagerTester.new()
		contracts = await deploymentHelper.deployDebtTokenTester(contracts)
		VesselManagerTester.setAsDeployed(contracts.vesselManager)

		const GRVTContracts = await deploymentHelper.deployGRVTContractsHardhat(accounts[0])

		priceFeed = contracts.priceFeedTestnet
		debtToken = contracts.debtToken
		sortedVessels = contracts.sortedVessels
		vesselManager = contracts.vesselManager
		activePool = contracts.activePool
		defaultPool = contracts.defaultPool
		collSurplusPool = contracts.collSurplusPool
		borrowerOperations = contracts.borrowerOperations
		adminContract = contracts.adminContract
		stabilityPool = contracts.stabilityPool

		grvtStaking = GRVTContracts.grvtStaking
		grvtToken = GRVTContracts.grvtToken
		communityIssuance = GRVTContracts.communityIssuance
		erc20 = contracts.erc20

		await deploymentHelper.connectCoreContracts(contracts, GRVTContracts)
		await deploymentHelper.connectGRVTContractsToCore(GRVTContracts, contracts)

		for (account of accounts.slice(0, 10)) {
			await erc20.mint(account, await web3.eth.getBalance(account))

			await openVessel({
				asset: erc20.address,
				extraVUSDAmount: toBN(dec(20000, 18)),
				ICR: toBN(dec(2, 18)),
				extraParams: { from: account },
			})
		}
	})

	describe("VesselManager", async accounts => {
		it("applyPendingRewards(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.applyPendingRewards(erc20.address, bob, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("updateRewardSnapshots(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.updateVesselRewardSnapshots(erc20.address, bob, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("removeStake(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.removeStake(erc20.address, bob, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("updateStakeAndTotalStakes(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.updateStakeAndTotalStakes(erc20.address, bob, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("closeVessel(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.closeVessel(erc20.address, bob, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("addVesselOwnerToArray(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.addVesselOwnerToArray(erc20.address, bob, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("setVesselStatus(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.setVesselStatus(erc20.address, bob, 1, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("increaseVesselColl(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.increaseVesselColl(erc20.address, bob, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("decreaseVesselColl(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.decreaseVesselColl(erc20.address, bob, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("increaseVesselDebt(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.increaseVesselDebt(erc20.address, bob, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
		it("decreaseVesselDebt(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			try {
				await vesselManager.decreaseVesselDebt(erc20.address, bob, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not the BorrowerOperations contract")
			}
		})
	})

	describe("ActivePool", async accounts => {
		it("sendAsset(): reverts when called by an account that is not BO nor VesselM nor SP", async () => {
			// Attempt call from alice
			try {
				await activePool.sendAsset(erc20.address, alice, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is neither BorrowerOperations nor VesselManager nor StabilityPool")
			}
		})
		it("increaseDebt(): reverts when called by an account that is not BO nor VesselM", async () => {
			// Attempt call from alice
			try {
				await activePool.increaseDebt(erc20.address, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is not a Gravita contract")
			}
		})
		it("decreaseDebt(): reverts when called by an account that is not BO nor VesselM nor SP", async () => {
			// Attempt call from alice
			try {
				await activePool.decreaseDebt(erc20.address, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is neither BorrowerOperations nor VesselManager nor StabilityPool")
			}
		})
		it.skip("fallback(): reverts when called by an account that is not Borrower Operations nor Default Pool", async () => {
			// Attempt call from alice
			try {
				const txAlice = await web3.eth.sendTransaction({
					from: alice,
					to: activePool.address,
					value: 100,
				})
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, "ActivePool: Caller is neither BO nor Default Pool")
			}
		})
	})

	describe("DefaultPool", async accounts => {
		it("sendAssetToActivePool(): reverts when called by an account that is not VesselManager", async () => {
			// Attempt call from alice
			try {
				await defaultPool.sendAssetToActivePool(erc20.address, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, "Caller is not the VesselManager")
			}
		})
		it("increaseDebt(): reverts when called by an account that is not VesselManager", async () => {
			// Attempt call from alice
			try {
				await defaultPool.increaseDebt(erc20.address, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, "Caller is not the VesselManager")
			}
		})
		it("decreaseDebt(): reverts when called by an account that is not VesselManager", async () => {
			// Attempt call from alice
			try {
				await defaultPool.decreaseDebt(erc20.address, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, "Caller is not the VesselManager")
			}
		})
		it.skip("fallback(): reverts when called by an account that is not the Active Pool", async () => {
			// Attempt call from alice
			try {
				const txAlice = await web3.eth.sendTransaction({
					from: alice,
					to: defaultPool.address,
					value: 100,
				})
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, "DefaultPool: Caller is not the ActivePool")
			}
		})
	})

	describe("StabilityPool", async accounts => {
		it("offset(): reverts when called by an account that is not VesselManager", async () => {
			// Attempt call from alice
			try {
				txAlice = await stabilityPool.offset(100, erc20.address, 10, { from: alice })
				assert.fail(txAlice)
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, "StabilityPool: Caller is not VesselManager")
			}
		})
		it("fallback(): reverts when called by an account that is not the Active Pool", async () => {
			// Attempt call from alice
			try {
				await erc20.transfer(stabilityPool.address, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, "StabilityPool: Caller is not ActivePool")
			}
		})
	})

	describe("DebtToken", async accounts => {
		it("mint(): reverts when called by an account that is not BorrowerOperations", async () => {
			// Attempt call from alice
			const txAlice = debtToken.mint(th.ZERO_ADDRESS, bob, 100, { from: alice })
			await th.assertRevert(txAlice, "Caller is not BorrowerOperations")
		})
		it("burn(): reverts when called by an account that is not BO nor VesselM nor SP", async () => {
			// Attempt call from alice
			try {
				const txAlice = await debtToken.burn(bob, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is neither BorrowerOperations nor VesselManager nor StabilityPool")
			}
		})
		it("sendToPool(): reverts when called by an account that is not StabilityPool", async () => {
			// Attempt call from alice
			try {
				const txAlice = await debtToken.sendToPool(bob, activePool.address, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				//assert.include(err.message, "Caller is not the StabilityPool")
			}
		})
		it("returnFromPool(): reverts when called by an account that is not VesselManager nor StabilityPool", async () => {
			// Attempt call from alice
			try {
				const txAlice = await debtToken.returnFromPool(activePool.address, bob, 100, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				// assert.include(err.message, "Caller is neither VesselManager nor StabilityPool")
			}
		})
	})

	describe("SortedVessels", async accounts => {
		it("insert(): reverts when called by an account that is not BorrowerOps or VesselM", async () => {
			// Attempt call from alice
			try {
				await sortedVessels.insert(erc20.address, bob, "150000000000000000000", bob, bob, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, " Caller is neither BO nor VesselM")
			}
		})
		it("remove(): reverts when called by an account that is not VesselManager", async () => {
			// Attempt call from alice
			try {
				await sortedVessels.remove(erc20.address, bob, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, " Caller is not the VesselManager")
			}
		})

		it("reinsert(): reverts when called by an account that is neither BorrowerOps nor VesselManager", async () => {
			// Attempt call from alice
			try {
				await sortedVessels.reInsert(erc20.address, bob, "150000000000000000000", bob, bob, { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
				assert.include(err.message, "Caller is neither BO nor VesselM")
			}
		})
	})

	describe("GRVTStaking", async accounts => {
		it("increaseFee_DebtToken(): reverts when caller is not VesselManager", async () => {
			try {
				const txAlice = await grvtStaking.increaseFee_DebtToken(dec(1, 18), { from: alice })
			} catch (err) {
				assert.include(err.message, "revert")
			}
		})
	})

	describe("CommunityIssuance", async accounts => {
		it("sendGRVT(): reverts when caller is not the StabilityPool", async () => {
			const tx1 = communityIssuance.sendGRVT(alice, dec(100, 18), { from: alice })
			const tx2 = communityIssuance.sendGRVT(bob, dec(100, 18), { from: alice })
			const tx3 = communityIssuance.sendGRVT(stabilityPool.address, dec(100, 18), {
				from: alice,
			})
			assertRevert(tx1)
			assertRevert(tx2)
			assertRevert(tx3)
		})
		it("issueGRVT(): reverts when caller is not the StabilityPool", async () => {
			const tx1 = communityIssuance.issueGRVT({ from: alice })
			assertRevert(tx1)
		})
	})
})

contract("Reset chain state", async accounts => {})
