const url = "http://localhost:8000/np/api/payment-return/esewa?cart_id=123&status=success?data=eyJzdGF0dXMiOiJDT01QTEVURSJ9";
const u = new URL(url);
console.log("status:", u.searchParams.get("status"));
console.log("data:", u.searchParams.get("data"));
