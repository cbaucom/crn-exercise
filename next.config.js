module.exports = {
  async rewrites() {
    return [
      {
        source: '/shifts/:shiftID',
        destination: 'http://localhost:9001/shifts/:shiftID',
      },
    ]
  },
}
