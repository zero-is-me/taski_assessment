class ApiResponse {
  constructor(data = {}, message = "OK") {
    this.success = true;
    this.data = data;
    this.message = message;
  }
}

export default ApiResponse;
