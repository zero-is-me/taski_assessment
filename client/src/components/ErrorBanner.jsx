const ErrorBanner = ({ message }) => {
  if (!message) return null;
  return <div className="message error">{message}</div>;
};

export default ErrorBanner;
