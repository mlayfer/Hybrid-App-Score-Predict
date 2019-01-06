app.filter('slice', function () {
    return function (arr, start, end) {
        if (!arr)
            return false;
        return arr.slice(start, end);
    }
});