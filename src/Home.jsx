function Home() {
  const callAPI = async () => {
    const res = await fetch("https://ccs-backend-in04.onrender.com/", {
      method: "POST",
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Welcome 🚀</h2>
      <button onClick={callAPI}>Test Backend</button>
    </div>
  );
}

export default Home;
