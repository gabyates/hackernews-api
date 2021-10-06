/* Core */
import * as yup from 'yup';

/* Instruments */
import type * as gql from '../../graphql';

export const userNameValidationRule = yup
    .string()
    .min(4, 'Name is ${min} characters minimum.')
    .required('Required.');
export const userEmailValidationRule = yup
    .string()
    .email('Email should be a valid email.')
    .required('Email is required.');

export const createSchema = (mode: Mode) => {
    const loginShape = {
        email:    userEmailValidationRule,
        password: yup
            .string()
            .min(4, 'Password is ${min} characters minimum.')
            .required('Password is required.'),
    };

    const signupShape = {
        ...loginShape,
        name: userNameValidationRule,
    };

    if (mode === 'login') {
        const login: yup.SchemaOf<gql.MutationLoginArgs> = yup
            .object(loginShape)
            .required();

        return login;
    }

    const signup: yup.SchemaOf<gql.MutationLoginArgs> = yup
        .object(signupShape)
        .required();

    return signup;
};

export const validateAuth = async (mode: Mode, payload: Payload) => {
    const schema = createSchema(mode);

    try {
        await schema.validate(payload);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/* Types */
type Mode = 'login' | 'signup';
type Payload = gql.MutationSignupArgs | gql.MutationLoginArgs;
