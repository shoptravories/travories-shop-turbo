const orig = "eyJzdGF0dXMiOiJDT01QTEVURSJ9";
// imagine it had a + that became a space
const withSpace = "eyJzdGF0dXMiOiJ DT01QTE VURSJ9";
try {
  console.log(Buffer.from(orig, "base64").toString("utf8"));
  console.log(Buffer.from(withSpace, "base64").toString("utf8"));
} catch (e) {
  console.log("Error:", e.message);
}
