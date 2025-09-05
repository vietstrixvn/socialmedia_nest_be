// // graphql.module.ts
// import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
// import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
// import { Module } from '@nestjs/common';
// import { GraphQLModule } from '@nestjs/graphql';
// import { join } from 'path';

// @Module({
//   imports: [
//     GraphQLModule.forRoot<ApolloDriverConfig>({
//       driver: ApolloDriver, // Apollo v5 driver
//       autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
//       sortSchema: true,
//       plugins: [ApolloServerPluginLandingPageLocalDefault()],
//     }),
//   ],
// })
// export class GraphqlModule {}
