
import {AuthProvider, AuthProviderProps} from "react-oidc-context"

export const cognitoConfig: AuthProviderProps = {
    authority : import.meta.env.VITE_COGNITO_AUTHORITY,
    client_id : import.meta.env.VITE_COGNITO_CLIENT_ID,
    redirect_uri : import.meta.env.VITE_REDIRECT_URI,
    response_type : 'code',
    scope: "email openid phone",
    onSigninCallback: () =>{
        window.history.replaceState({}, document.title, window.location.pathname);
    }
} as const;


export const CognitoAuthProvider = ({children}: {children: React.ReactNode}) => {

    return (
        <AuthProvider {...cognitoConfig}>
            {children}
        </AuthProvider>
    )
}
