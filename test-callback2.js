const payload = { status: "COMPLETE", transaction_uuid: "cart-01M1E54FKB2V7DSR29HEP23WRV-1788260009687" };
const b64 = Buffer.from(JSON.stringify(payload)).toString("base64");
const url = `http://localhost:8000/api/payment-return/esewa?cart_id=cart_01M1E54FKB2V7DSR29HEP23WRV&country_code=np&status=success?data=${b64}`;
console.log(url);
