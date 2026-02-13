/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
//const apiGatewayBaseUrl = 'http://103.239.138.237:8080';
const apiGatewayBaseUrl = 'http://localhost:5000';
//ddd
export const environment = {
  production: false,
  apiGatewayBaseUrl,  // Common base URL

  // Services
  masterServiceBaseUrl: `${apiGatewayBaseUrl}/master`,
  authApiBaseUrl: `${apiGatewayBaseUrl}/api/auth`,
  categoryApiBaseUrl: `${apiGatewayBaseUrl}/api/categories`,
  brandApiBaseUrl: `${apiGatewayBaseUrl}/api/brands`,
  paymentApiBaseUrl: `${apiGatewayBaseUrl}/api/payment`, // 🆕 New
  orderApiBaseUrl: `${apiGatewayBaseUrl}/api/orders`, // 🆕 New
  reviewApiBaseUrl: `${apiGatewayBaseUrl}/api/reviews`, // 🆕 New
  returnApiBaseUrl: `${apiGatewayBaseUrl}/api/returns`, // 🆕 New
  razorpayKey: 'rzp_test_YOUR_KEY_ID', // Replace with actual Key ID
  inventoryBaseUrl: `${apiGatewayBaseUrl}/inventory`,
  googleClientId: '593948393267-hkotj79e2304gipjjn24njnakb6t38ai.apps.googleusercontent.com', // Replace with actual Google Client ID
};
