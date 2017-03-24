// see if it looks and smells like an iterable object, and do accept length === 0
// See: http://stackoverflow.com/a/24048615
module.exports = function (item) {
    return (
        Array.isArray(item) ||
        (!!item &&
          typeof item === "object" &&
          typeof (item.length) === "number" &&
          (item.length === 0 ||
             (item.length > 0 &&
             (item.length - 1) in item)
          )
        )
    )
}
