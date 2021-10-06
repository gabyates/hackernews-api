/* Core */
import * as yup from 'yup';

/* Instruments */
import type * as gql from '../../graphql';
import {
    userNameValidationRule,
    userEmailValidationRule
} from './validateAuth';

export const validateUpdateUser = async (payload: Payload) => {
    const schema: yup.SchemaOf<Payload> = yup
        .object({
            id:    yup.string().required(),
            name:  userNameValidationRule,
            email: userEmailValidationRule,
            bio:   yup.string().max(100, 'Bio max length is ${max} characters.'),
        })
        .required();

    try {
        await schema.validate(payload);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/* Types */
type Payload = gql.MutationUpdateUserArgs;
