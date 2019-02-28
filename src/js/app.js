App={
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	tokenPrice: 1000000000000000, //in Wei which is equal to 0.001 Ether
	tokensSold: 0,
	tokensAvailable: 750000,

	init: function(){
		console.log("Application initialized...")
		return App.initWeb3();
	},

	initWeb3: function(){
		if(typeof web3 !== 'undefined'){
			//If a web3 instance is already provided by Meta Mask.
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			//Specify default instance if no web3 instance provided
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContracts();
	},

	initContracts: function(){
		$.getJSON("RBATokenSale.json", function(rbaTokenSale){
			App.contracts.RBATokenSale = TruffleContract(rbaTokenSale);
			App.contracts.RBATokenSale.setProvider(App.web3Provider);
			App.contracts.RBATokenSale.deployed().then(function(rbaTokenSale){
				console.log("RBA Token Sale Address:", rbaTokenSale.address);
			});
		}).done(function(){
			$.getJSON("RBAToken.json", function(rbaToken){
			App.contracts.RBAToken = TruffleContract(rbaToken);
			App.contracts.RBAToken.setProvider(App.web3Provider);
			App.contracts.RBAToken.deployed().then(function(rbaToken){
			console.log("RBA Token Address:", rbaToken.address);
				});
			App.listenForEvents();
			return App.render();
			});
		})
	},

	//Listens for events emitted from the contract
	listenForEvents: function() {
		App.contracts.rbaTokenSale.deployed().then(function(instance){
			instance.Sell({}, {
				fromBlock: 0,
				toBlock: 'latest',
			}).watch(function(error, event){
				console.log("Event Triggered", event);
				App.render();
			})
		})
	},

	render: function(){
		if (App.loading){
			return;
		}
		App.loading = true;
		
		var loader = $('#loader');
		var content = $('#content');

		loader.show();
		content.hide();

		//Load Account Data
		web3.eth.getCoinbase(function(err, account){
			if(err === null){
				console.log("Account:", account);
				App.account = account;
				$('#accountAddress').html("Your Account: " + account);
			}
		})

		//Load Token Sale Contract
		App.contracts.RBATokenSale.deployed().then(function(instance){
			rbaTokenSaleInstance = instance;
			return rbaTokenSaleInstance.tokenPrice();
		}).then(function(tokenPrice){
			console.log("Token Price: ", tokenPrice.toNumber());
			App.tokenPrice = tokenPrice;
			$('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
			return rbaTokenSaleInstance.tokensSold();
		}).then(function(tokensSold){
			App.tokensSold = tokensSold.toNumber();
			$('.tokens-sold').html(App.tokensSold);
			$('.tokens-available').html(App.tokensAvailable);

			var progressPercent =(Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
			$('#progress').css('width', progressPercent + '%');
			
			//Load Token Contract
			App.contracts.RBAToken.deployed().then(function(instance){
				rbaTokenInstance = instance;
				return rbaTokenInstance.balanceOf(App.account);
			}).then(function(balance){
				console.log("Balance: ", balance.toNumber());
				$('.rba-balance').html(balance.toNumber());
			
				App.loading = false;
				loader.hide();
				content.show();
			})
		});
	},

	buyTokens: function(){
		$('#content').hide();
		$('#loader').show();

		var numberOfTokens = $('#numberOfTokens').val();
		App.contracts.RBATokenSale.deployed().then(function(instance){
			return instance.buyTokens(numberOfTokens, {
				from: App.account,
				value: numberOfTokens * App.tokenPrice,
				gas: 500000
			});
		}).then(function(result){
			console.log("Tokens Bought...")
			$('form').trigger('reset') //Reset number of tokens in form
			//Wait for Sell Event
		});
	}
}

$(function(){
	$(window).load(function(){
		App.init();
	})
});