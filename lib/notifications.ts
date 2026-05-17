// Placeholder notification functions - wire up LINE Messaging API later

export async function notifyAdminNewRequest(requestId: string, clientName: string): Promise<void> {
  // TODO: Send LINE message to admin when client submits a request
  console.log(`[notification] New request ${requestId} from ${clientName}`);
}

export async function notifyClientDelivered(clientLineUserId: string, requestId: string): Promise<void> {
  // TODO: Send LINE message to client when delivery is complete
  console.log(`[notification] Delivery complete for request ${requestId} to ${clientLineUserId}`);
}
