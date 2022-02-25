import logo from './logo.svg';
import { useState } from 'react';
import { ethers } from 'ethers';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';
import Token from './artifacts/contracts/Token.sol/Token.json';
import './App.css';

const greeterAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const tokenAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";


function App() {

  const [greeting, setGreetingValue] = useState('');
  const [userAccount, setUserAccount] = useState('');
  const [amount, setAmmount] = useState(0);

  // request access to the user's MetaMask account
  async function requestAccount() {
    // pide al usuario que se connecte a metamask
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function getBalance() {
        // comprobar si estan usando metamask en el browser o si tienen una wallet conectada
        if (typeof window.ethereum !== 'undefined') {
          const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(tokenAddress, Token.abi, provider)
          const balance = await contract.balanceOf(account);
          console.log("Balance: ", balance.toString());
        }
  }

  async function sendCoins() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transation = await contract.transfer(userAccount, amount);
      await transation.wait();
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
    }
  }
  
  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    // comprobar si estan usando metamask en el browser
    if (typeof window.ethereum !== 'undefined') {
      //vamos a usar el Web3 provider
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // una instancia del contrato, pasando l direccion del contrato, el ABI y el provider
      // usando esta variable contract podemos llamar a los metodos del contrato
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        // intenta llamar al metodo greet() de mi smart contract de prueba creado por hardhat
        // devuelve el return si todo esta bien, sino devuelve el error
        const data = await contract.greet()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  async function setGreeting() {
    //chequeamos si escribieron un imput
    if (!greeting) return
    // preguntamos si esta window.ethereum instalado
    if (typeof window.ethereum !== 'undefined') {
      // pedimos que se conecten a metamask
      await requestAccount()
      // nuevo provider, como vamos a actualizar la blockchain llamamos un nuevo provider para que pueda firmar
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // llamamos al metodo getSigner y creamos una nueva instancia del contrato con el getSigner en vez de provider
      const signer = provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      // ahora si llamamos a la funcion set.greeting con el input que metio el usuario
      const transaction = await contract.setGreeting(greeting)
      // espera que se confirme la transaccion en la blockchain
      setGreetingValue('');
      await transaction.wait()
      // llamar al fetchGreeting para mostrar que funca
      fetchGreeting()
    }
  }

  return (
    <div className="App">
     <header className="App-header">
      <button onClick={fetchGreeting}>Fetch Greeting</button>
      <button onClick={setGreeting}>Set greeting</button>
      <input
      onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" value={greeting}
      />

     </header>
    </div>
  );
}

export default App;
