import axios from 'axios'
import * as jose from 'jose'

export const decryptParams = async (data: string) => {
    const { payload, protectedHeader }: any = await jose.jwtVerify(new TextEncoder().encode(data), new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY), {
        issuer: 'ps',
        audience: 'ps',
    }).catch(err => console.log('error: ' + err))

    return JSON.parse(payload.sub)
}

export const encryptParams = async (data: object | any) => {
    const jwt = await new jose.SignJWT({
        'urn:example:claim': true,
        'sub': JSON.stringify(data)
    })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setIssuer('ps')
        .setAudience('ps')
        .setExpirationTime('2h')
        .sign(new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY))

    return jwt
}

export const axiosBase = () => {
    return axios.create({
        baseURL: 'http://localhost:8080',
    })
}