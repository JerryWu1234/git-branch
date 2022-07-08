# bt-git

主要用于企业级的分支管理工具

# install

```bash
pnpm install bt-git -g

```


# usage 
在你需要提交的项目里输入命令

```bash
bt-git -m master -t test 
```

# Options

#### -m or -major

* type: string
* required: true

主分支，例如:master


#### -t or -target
* type: string
* required: false

将你现在的分支合并到 target 分支


#### -u or -url
* type: string
* required: false

线上提交合并请求的url