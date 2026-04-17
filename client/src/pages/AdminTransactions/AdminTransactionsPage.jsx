import { useEffect, useState } from "react";
import { fetchAdminTransactions } from "../../api/admin";
import { getErrorMessage } from "../../api/axios";
import ErrorBanner from "../../components/ErrorBanner";
import LoadingBlock from "../../components/LoadingBlock";

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await fetchAdminTransactions();
        setTransactions(data.data.transactions);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) {
    return <LoadingBlock label="Loading transactions..." />;
  }

  return (
    <div className="grid">
      <div className="card">
        <h1>All wallet transactions</h1>
        <p className="subtle">Credits, debits, and refunds across the whole system.</p>
      </div>
      <ErrorBanner message={error} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((item) => (
              <tr key={item._id}>
                <td>{item.userId?.email}</td>
                <td>{item.type}</td>
                <td>Rs. {(item.amountInPaise / 100).toFixed(2)}</td>
                <td>{item.description}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!transactions.length && (
              <tr>
                <td colSpan="5">No transactions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
