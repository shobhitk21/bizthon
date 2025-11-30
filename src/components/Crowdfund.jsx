import { useState } from "react";
import { ethers } from "ethers";
import { Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import heroImage from "@/assets/crowdfund-hero.jpg";

function Crowdfund() {
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [signer2, setSigner2] = useState(null);
  const [contract, setContract] = useState(null);
  const [contract2, setContract2] = useState(null);
  const [yourBalance, setYourBalance] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const contractAddress = "0x31a1A54627B7A118140472A7e555c820E0A514eA";

  async function main() {
    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts);
      setAccounts(accounts[0]);
      const provider1 = new ethers.BrowserProvider(window.ethereum);
      console.log(provider1);
      setProvider(provider1);

      const abi = [
        {
          inputs: [],
          name: "endFunding",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "setFund",
          outputs: [],
          stateMutability: "payable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_endTime",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "_goalAmount",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
          ],
          name: "withdrawalSomeFunds",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "withdrawlAll",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "checkAllFunds",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "myAddress",
              type: "address",
            },
          ],
          name: "checkYourFunds",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "endTime",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "goalAmount",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "isStarted",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ];

      const signer1 = await provider1.getSigner(accounts[0]);
      const signer2 = await provider1.getSigner(accounts[1]);
      setSigner2(signer2);
      setSigner(signer1);
      const crowdFundContract = new ethers.Contract(contractAddress, abi, signer1);
      const crowdFundContract2 = new ethers.Contract(contractAddress, abi, signer2);
      setContract2(crowdFundContract2);
      setContract(crowdFundContract);
      
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }

  async function handleBalanceCheck() {
    try {
      setIsLoading(true);
      const balanceAll = await contract.checkAllFunds();
      const balanceInEth = ethers.formatEther(balanceAll);
      setBalance(balanceInEth);
      console.log(balanceAll.toString());
      toast.success("Balance fetched successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleYourBalance() {
    if (!contract) {
      console.error("Contract not ready");
      toast.error("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      const address = await contract.runner.getAddress();
      const yourFunds = await contract.checkYourFunds(address);
      const fundsInEth = ethers.formatEther(yourFunds);
      setYourBalance(fundsInEth);
      console.log("Your funds:", yourFunds.toString());
      toast.success("Your balance fetched successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your balance");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSetFund() {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      const txn = await contract2.setFund({
        value: ethers.parseEther(donationAmount),
      });
      toast.info("Transaction submitted, waiting for confirmation...");
      await txn.wait();
      console.log(txn);
      toast.success("Donation successful!");
      setDonationAmount("");
      // Refresh balances
      await handleBalanceCheck();
      await handleYourBalance();
    } catch (error) {
      console.error(error);
      toast.error("Donation failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function withdrawAll() {
    try {
      setIsLoading(true);
      const txn = await contract2.withdrawlAll();
      toast.info("Withdrawal submitted, waiting for confirmation...");
      await txn.wait();
      console.log(txn);
      toast.success("Withdrawal successful!");
      // Refresh balances
      await handleBalanceCheck();
      await handleYourBalance();
    } catch (error) {
      console.error(error);
      toast.error("Withdrawal failed");
    } finally {
      setIsLoading(false);
    }
  }

  function shortenAddress(addr) {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CrowdFund DApp
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {!accounts ? (
                <Button
                  onClick={main}
                  disabled={isConnecting}
                  className="shadow-glow"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              ) : (
                <div className="px-4 py-2 rounded-full bg-gradient-primary/10 border border-primary/20 backdrop-blur-sm">
                  <span className="text-sm font-medium text-foreground">
                    {shortenAddress(accounts)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Hero Card */}
          <Card className="overflow-hidden backdrop-blur-xl bg-card/80 border-border/40 shadow-elegant animate-float">
            <div className="relative h-64 overflow-hidden">
              {/* <img
                src={heroImage}
                alt="Crowdfunding Campaign"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
              /> */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Support Our Mission
                </h2>
                <p className="text-muted-foreground">
                  Join the community in funding innovation
                </p>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-6">
              {/* Donation Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">
                  Donation Amount (ETH)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="0.00"
                    className="text-lg h-12 pl-4 pr-16 bg-background/50 border-border/60 focus:border-primary transition-all"
                    step="0.001"
                    min="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    ETH
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleSetFund}
                    disabled={isLoading || !contract}
                    className="h-12 shadow-glow"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowUpCircle className="w-4 h-4 mr-2" />
                    )}
                    Donate
                  </Button>

                  <Button
                    onClick={withdrawAll}
                    disabled={isLoading || !contract}
                    variant="destructive"
                    className="h-12"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 mr-2" />
                    )}
                    Withdraw All
                  </Button>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Balance Check Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleBalanceCheck}
                  disabled={isLoading || !contract}
                  variant="outline"
                  className="h-12"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4 mr-2" />
                  )}
                  Total Balance
                </Button>

                <Button
                  onClick={handleYourBalance}
                  disabled={isLoading || !contract}
                  variant="outline"
                  className="h-12"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2" />
                  )}
                  Your Balance
                </Button>
              </div>

              {/* Balance Display */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gradient-primary/5 border border-primary/10">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Total Pool
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {balance ? `${parseFloat(balance).toFixed(4)} ETH` : "--"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Your Balance
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {yourBalance ? `${parseFloat(yourBalance).toFixed(4)} ETH` : "--"}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Crowdfund;
