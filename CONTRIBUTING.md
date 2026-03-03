# Contributing

## Setup

```bash
git clone https://github.com/ericjy/inkframe.git
cd inkframe
pnpm install
```

## Development

```bash
pnpm build       # build once
pnpm dev         # watch mode
pnpm test        # run tests
pnpm typecheck   # type check without building
```

## Making changes

1. Fork the repo and create a branch
2. Make your changes
3. Add or update tests as needed — `pnpm test` must pass
4. Run `pnpm typecheck` to ensure no type errors
5. Open a pull request with a clear description of the change

## Reporting bugs

Open an issue at https://github.com/ericjy/inkframe/issues with steps to reproduce.
