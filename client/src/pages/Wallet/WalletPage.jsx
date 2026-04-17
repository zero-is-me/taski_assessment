import { useEffect, useState } from "react";
import { addMoney } from "../../api/wallet";
import { getErrorMessage } from "../../api/axios";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingBlock from "../../components/LoadingBlock";
import SuccessBanner from "../../components/SuccessBanner";
import { useWalletStore } from "../../store/walletStore";

const toRupees = (amount = 0) => `Rs. ${(amount / 100).toFixed(2)}`;

const WalletPage = () => {
  const { wallet, transactions, loading, error, hydrate, setWallet } = useWalletStore();
  const [amountInPaise, setAmountInPaise] = useState(50000);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setLocalError("");
    setMessage("");

    try {
      const { data } = await addMoney({ amountInPaise: Number(amountInPaise) });
      setWallet(data.data.wallet);
      setMessage("Wallet topped up");
      hydrate();
    } catch (error) {
      setLocalError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !wallet) {
    return <LoadingBlock label="Loading wallet..." />;
  }

  return (
    <div className="grid">
      <div className="hero">
        <section className="hero-card">
          <p className="subtle">Wallet balance</p>
          <h1>{toRupees(wallet?.balanceInPaise || 0)}</h1>
          <p className="subtle">Stored in paise under the hood, shown in rupees only here.</p>
        </section>
        <section className="hero-card">
          <h2>Add money</h2>
          <ErrorBanner message={localError || error} />
          <SuccessBanner message={message} />
          <form onSubmit={handleAdd}>
            <div className="field">
              <label>Amount in paise</label>
              <input
                type="number"
                min="1"
                step="1"
                value={amountInPaise}
                onChange={(e) => setAmountInPaise(e.target.value)}
                required
              />
            </div>
            <button className="btn" disabled={saving}>
              {saving ? "Adding..." : "Add to wallet"}
            </button>
          </form>
        </section>
      </div>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item._id}>
                <td>{item.type}</td>
                <td>{item.description}</td>
                <td>{toRupees(item.amountInPaise)}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!transactions.length && (
              <tr>
                <td colSpan="4">No wallet activity yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default WalletPage;
