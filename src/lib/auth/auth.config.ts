import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from './jwt';
import { checkUserPermissions } from '../admin/permissions/permissions';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (!user || !user.hashedPassword) {
          throw new Error('用户不存在或密码错误');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error('用户不存在或密码错误');
        }

        if (user.status === 'banned') {
          throw new Error('账号已被封禁');
        }

        if (user.status === 'inactive') {
          throw new Error('账号未激活，请先激活账号');
        }

        // 记录登录日志
        await prisma.loginLog.create({
          data: {
            userId: user.id,
            ip: credentials.ip || '',
            userAgent: credentials.userAgent || '',
            status: 'success'
          }
        });

        // 更新最后登录时间
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.roles[0]?.role.name || 'user',
          permissions: user.roles.flatMap(ur => 
            ur.role.permissions.map(rp => rp.permission.key)
          )
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        // 允许客户端更新session数据
        token = { ...token, ...session };
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
        token.permissions = user.permissions;
      }

      // 每次请求时刷新用户权限
      if (token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (freshUser) {
          token.role = freshUser.roles[0]?.role.name || 'user';
          token.permissions = freshUser.roles.flatMap(ur => 
            ur.role.permissions.map(rp => rp.permission.key)
          );
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 登录后重定向到管理后台
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl + '/admin/dashboard';
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};