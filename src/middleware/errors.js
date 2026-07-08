function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = status >= 500 ? "Something went wrong" : err.message;
  if (status >= 500 && process.env.NODE_ENV !== "test") {
    console.error(err);
  }
  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
