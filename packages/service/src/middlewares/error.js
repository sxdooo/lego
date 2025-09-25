module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        ctx.status = error.status || 500;
        ctx.body = {
            error: error.message || 'Internal Server Error',
        }
        console.error(error)
    }
}