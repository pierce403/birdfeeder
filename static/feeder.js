
console.log("let's do this thing");

let provider = new ethers.providers.Web3Provider(web3.currentProvider);
let address  = '0xd803d7597bd638998be368af196dc2c53caf5b63';

var abi = [{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"sum","type":"uint256"},{"name":"userid","type":"uint256"}],"name":"dispense","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contributors","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lowest","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lowestAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"paid","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"top8","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]

let birdFeeder = new ethers.Contract(address,abi,provider);

let balancePromise = birdFeeder.getBalance();
callPromise.then(function(result){
  console.log(result.toString());
});

let top8=[]
for(let i=0;i<8;++i)
{
let promise = birdFeeder.top8(i);
promise.then(function(result){
  top8[i]=result;
  console.log(i+" : "+result);
});
}

