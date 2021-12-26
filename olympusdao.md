### Bond price

```javascript

try {
      // TODO (appleseed): improve this logic
      if (bond.name === "cvx") {
        let bondPriceRaw = await bondContract.bondPrice();
        let assetPriceUSD = await bond.getBondReservePrice(networkID, provider);
        let assetPriceBN = ethers.utils.parseUnits(assetPriceUSD.toString(), 14);
        // bondPriceRaw has 4 extra decimals, so add 14 to assetPrice, for 18 total
        bondPrice = bondPriceRaw.mul(assetPriceBN);
      } else {
        bondPrice = await bondContract.bondPriceInUSD();
      }
      bondDiscount = (marketPrice * Math.pow(10, 18) - Number(bondPrice.toString())) / Number(bondPrice.toString()); // 1 - bondPrice / (bondPrice * Math.pow(10, 9));
    } catch (e) {
      console.log("error getting bondPriceInUSD", bond.name, e);
    }

    if (Number(value) === 0) {
      // if inputValue is 0 avoid the bondQuote calls
      bondQuote = BigNumber.from(0);
    } else if (bond.isLP) {
      valuation = Number(
        (await bondCalcContract.valuation(bond.getAddressForReserve(networkID) || "", amountInWei)).toString(),
      );
      bondQuote = await bondContract.payoutFor(valuation);
      if (!amountInWei.isZero() && Number(bondQuote.toString()) < 100000) {
        bondQuote = BigNumber.from(0);
        const errorString = "Amount is too small!";
        dispatch(error(errorString));
      } else {
        bondQuote = Number(bondQuote.toString()) / Math.pow(10, 9);
      }
    } else {
      // RFV = DAI
      bondQuote = await bondContract.payoutFor(amountInWei);

      if (!amountInWei.isZero() && Number(bondQuote.toString()) < 100000000000000) {
        bondQuote = BigNumber.from(0);
        const errorString = "Amount is too small!";
        dispatch(error(errorString));
      } else {
        bondQuote = Number(bondQuote.toString()) / Math.pow(10, 18);
      }
    }

    // Display error if user tries to exceed maximum.
    if (!!value && parseFloat(bondQuote.toString()) > Number(maxBondPrice.toString()) / Math.pow(10, 9)) {
      const errorString =
        "You're trying to bond more than the maximum payout available! The maximum bond payout is " +
        (Number(maxBondPrice.toString()) / Math.pow(10, 9)).toFixed(2).toString() +
        " OHM.";
      dispatch(error(errorString));
    }

    // Calculate bonds purchased
    let purchased = await bond.getTreasuryBalance(networkID, provider);

    return {
      bond: bond.name,
      bondDiscount,
      debtRatio: Number(debtRatio.toString()),
      bondQuote: Number(bondQuote.toString()),
      purchased,
      vestingTerm: Number(terms.vestingTerm.toString()),
      maxBondPrice: Number(maxBondPrice.toString()) / Math.pow(10, 9),
      bondPrice: Number(bondPrice.toString()) / Math.pow(10, 18),
      marketPrice: marketPrice,
    };
  },
  
 ```
 
