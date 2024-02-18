export const findSocketId = (username: string, users: { [username: string]: string }) => {
    return Object.keys(users).find((key) => users[key] === username);
}