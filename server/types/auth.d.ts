declare module '#auth-utils' {
    interface User {
        id: string;
    }

    interface UserSession {
        validCredentials: boolean;
    }

    interface SecureSessionData {
        message: string;
    }
}

export { }