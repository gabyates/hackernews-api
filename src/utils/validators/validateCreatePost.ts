/* Core */
import * as yup from 'yup';

/* Instruments */
import type * as gql from '../../graphql';

export const validateCreatePost = async (payload: Payload) => {
    const schema: yup.SchemaOf<Payload> = yup
        .object({
            url: yup
                .string()
                .url('Url must be a valid url like https://www.example.com')
                .required('Url is required.'),
            description: yup
                .string()
                .min(10, 'Description must be at least ${min} characters long.')
                .max(80, 'Description must be ${min} characters max.')
                .required('Description is required.'),
        })
        .required();

    try {
        await schema.validate(payload);
    } catch (error: any) {
        throw new Error(error.message);
    }
};

/* Types */
type Payload = gql.MutationCreatePostArgs;
