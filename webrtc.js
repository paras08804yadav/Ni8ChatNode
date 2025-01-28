function setSocketsio(io) {
  io.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      next();
    } else {
      next(new Error("Invalid handshake query"));
    }
  });

  io.on("connection", (socket) => {
    console.log(socket.user, "Connected");
    socket.join(socket.user.callerId);

    socket.on("makeCall", (data) => {
      let calleeId = data.calleeId;
      let sdpOffer = data.sdpOffer;
      let calleeMainId = data.calleeMainId;
      let callType = data.callType;

      console.log("Received data in makeCall:", data);

      const response = {
        callerId: socket.user.callerId,
        sdpOffer: sdpOffer,
        callType: callType,
        calleeMainId: calleeMainId,
      };
      console.log("Sending response in newCall:", response);


      socket.to(calleeId).emit("newCall", {
      callerId: socket.user.callerId,
      sdpOffer: sdpOffer,
      callType: callType,
      calleeMainId: calleeMainId,
      });
    });

    socket.on("answerCall", (data) => {
      let callerId = data.callerId;
      let sdpAnswer = data.sdpAnswer;

    socket.to(callerId).emit("callAnswered", {
      callee: socket.user.callType,
      calleeMainId: socket.user.calleeMainId,
      sdpAnswer: sdpAnswer,
    });
  });

  socket.on("IceCandidate", (data) => {
    let calleeId = data.calleeId;
    let iceCandidate = data.iceCandidate;

    socket.to(calleeId).emit("IceCandidate", {
      sender: socket.user.callerId,
      iceCandidate: iceCandidate,
    });
  });
  socket.on("leaveCall", (data) => {
    const { callerId, calleeId } = data;

    console.log(`${socket.user.callerId} has left the call`);

    // Notify the other user
    socket.to(calleeId).emit("callEnded", { userId: callerId });

    // Disconnect user from room
    socket.leave(calleeId);
  });
});

  return io;

}


module.exports = { setSocketsio };