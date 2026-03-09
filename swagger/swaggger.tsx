import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'LMS API',
            version: '1.0.0',
            description: 'Learning Management System API documentation',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    // Include .ts/.tsx for dev and compiled .js for production
    apis: ['./app/api/**/*.ts', './app/api/**/*.tsx', './dist/**/*.js'],
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);