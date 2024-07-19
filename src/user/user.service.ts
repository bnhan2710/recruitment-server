import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { genSaltSync, hashSync } from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    private genHashPassword(password: string): string {
        const salt = genSaltSync(10);
        return hashSync(password, salt);
    }

    async create(createUserDto: CreateUserDto) {
      try {
          const existingUser = await this.userModel.findOne({ email: createUserDto.email });
          if (existingUser) {
              return {
                  statusCode: 400,
                  message: 'User with this email already exists',
              };
          }
  
          const hashPassword = this.genHashPassword(createUserDto.password);
          const user = await this.userModel.create({
              ...createUserDto,
              password: hashPassword
          });
          const {password,...other} = user
          return {
              statusCode: 201,
              message: 'User created successfully',
              user,
          };
      } catch (error) {
          return {
              statusCode: 500,
              message: 'Create User Failed',
              err: error,
          };
      }
  }
  

  async findAll() {
    try {
        const users = await this.userModel.find();
        if (!users || users.length === 0) {
            return {
                statusCode: 404,
                message: 'There are no users',
            };
        }
        const usersWithoutPassword = users.map(user => {
            const { password, ...other } = user.toObject();
            return other;
        });
        return {
            statusCode: 200,
            users: usersWithoutPassword,
        };
    } catch (error) {
        return {
            statusCode: 500,
            message: 'Find All Users Failed',
        };
    }
}


    async findOne(id: string) {
        try {
            const user = await this.userModel.findById(id);
            if (!user) {
                return {
                    statusCode: 404,
                    message: 'User Not Found'
                };
            }
            const { password, ...other } = user.toObject();
            return {
                statusCode: 200,
                user: other
            };
        } catch (error) {
            return {
                statusCode: 500,
                message: 'Find User Failed',
                err: error,
            };
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        try {
            const update = await this.userModel.updateOne({ _id: id }, { $set: updateUserDto });
            if (update.modifiedCount === 0) {
                return {
                    statusCode: 404,
                    message: 'User Not Found or No Changes Made',
                };
            }
            return {
                statusCode: 200,
                message: 'Update Successfully',
                metadata: update,
            };
        } catch (error) {
            return {
                statusCode: 500,
                message: 'Update Failed',
                err: error,
            };
        }
    }

    async remove(id: string) {
        try {
            const deleteResult = await this.userModel.deleteOne({ _id: id });
            if (deleteResult.deletedCount === 0) {
                return {
                    statusCode: 404,
                    message: 'User Not Found'
                };
            }
            return {
                statusCode: 200,
                message: 'User Removed Successfully',
            };
        } catch (error) {
            return {
                statusCode: 500,
                message: 'Remove Failed',
                err: error,
            };
        }
    }
}
